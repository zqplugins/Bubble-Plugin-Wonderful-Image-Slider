function(instance, context) { // Wonderful Image Slider -> Wonderful Image Slider V2 -> initialize
    
    instance.data.originalSource = [];
    instance.data.originalAltImages = [];
    instance.data.originalTextes = [];
    instance.data.originalUrls = [];
    instance.data.originalAlts = [];
    
    instance.canvas.addClass('swiper-parent');
    
    // Extend Swiper with our utility methods
    class WonderfulSwiper extends Swiper {
        constructor(container, params) {
            super(container, params);
            this.initCustomZoomEvents();
        }

        initCustomZoomEvents() {
            const originalZoomIn = this.zoom.in.bind(this.zoom);
            const originalZoomOut = this.zoom.out.bind(this.zoom);

            this.zoom.in = (...args) => {
                originalZoomIn(...args);
                const zoomInEvent = new CustomEvent('swiperZoomIn', { detail: { swiper: this } });
                this.el.dispatchEvent(zoomInEvent);
            };

            this.zoom.out = (...args) => {
                originalZoomOut(...args);
                const zoomOutEvent = new CustomEvent('swiperZoomOut', { detail: { swiper: this } });
                this.el.dispatchEvent(zoomOutEvent);
            };
        }
        
        // We need a method that will apply "imgix" parameters for our images
        applyImgix(url, {
            redeye,
            format,
            enhance,
            compress,
            quality,
            manualquality,
            fit,
            dpr,
            imgixh,
            imgixw
        }) {
            if (!url) return
            
            url = url.replaceAll("https:", "")

            let formatString = (compress ? "compress," : "") + (enhance ? "enhance," : "") + (format ? "format," : "") + (redeye ? "redeye," : "")
            formatString = !formatString ? "false" : formatString
            formatString += (manualquality ? `&q=${quality}` : "")

            return `https://d1muf25xaso8hp.cloudfront.net/https%3A${encodeURIComponent(url)}?w=&auto=${formatString}&dpr=${dpr}&fit=${fit}`
        }
        
        // This method will build slide skeleton and populate it with slide information (image, alt-image, alt, text, url) and will append it to slider itself
    	async appendGenericSlide({
            url,
            open,
            text,
            alt,
            altImage,
            image,
            defaultImage,
            text_left,
            text_top,
            text_shadow_spec,
            text_shadow_color,
            element_width,
            element_height,
            element_margin,
            element_border_radius,
            element_background,
            object_fit,
            element_border_width,
            element_border_style,
            element_border_color,
            text_background
        }) {
            return new Promise((resolve, reject) => {
                let preloader;

                const slide = $("<div>")
                slide.addClass("swiper-slide")
                slide.css({
                    width: "100%",
                    height: "auto",
                    textAlign: "center",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                    boxSizing: "border-box",
                    background: "var(--slider-img-bg, rgba(255,255,255,0))",
                    border: `${element_border_width}px ${element_border_style} ${element_border_color}`,
                    borderRadius: element_border_radius,
                    overflow: 'hidden'
                })

                const link = (!!url) ? $("<a>") : $("<span role = 'link'>") // #new [SEOOptimization]
                link.css("cursor", "default")
                if (!!url) {
                    link.attr("href", url)
                    link.css("cursor", "pointer")
                    link.attr("onclick", `return ${open}`)
                    link.attr("target", "_blank")
                }

                const paragraph = $("<p>")
                paragraph.css({ position: "absolute", left: `${text_left}%`, top: `${text_top}%`, textShadow: `${text_shadow_spec} ${text_shadow_color}`, transform: "translate(-50%, -50%)", padding: "10px", background: !!text ? text_background : "transparent" })
                if (!!text) {
                    paragraph.text(text)
                }

                const img = $("<img>")
                if (instance.data.lazy) {
                    img.attr('loading', 'lazy')
                    preloader = $(`<div class="swiper-lazy-preloader"></div>`)
                }

                if (image) img.attr("src", image)
                else if (altImage) img.attr("src", altImage)
                else img.attr("src", defaultImage)

                img.css({
                    width: `${element_width}%`,
                    height: `${element_height}%`,
                    marginTop: `${element_margin}%`,
                    background: "var(--slider-img-bg, rgba(255,255,255,0))",
                    objectFit: object_fit,
                })
                
                img.attr("alt", alt)
                img.on("error", function() {
                    if ($(this).attr('src') === image && altImage) {
                        $(this).attr('src', altImage)
                    } else {
                        $(this).attr('src', defaultImage)
                    }
                })

                img.on('load', function() {
                    resolve(this.src);
                });

                link.append(paragraph)

                if (instance.data.zoom) {
                    const zoomContainer = $(`<div class="swiper-zoom-container"></div>`)
                    zoomContainer.append(img)

                    zoomContainer.append(link)
                    slide.append(zoomContainer)
                } else {
                    slide.append(link)
                    slide.append(img)
                }


                if (preloader) {
                    slide.append(preloader)
                }

                this.appendSlide(slide)
            });
        }
    }
    
    function initSwiper(effect = 'slide', cb) {
        // Preparing UI stuff
        const swiperEl = $("<div>")
        swiperEl.addClass("swiper")
        swiperEl.css({ width: "100%", height: "100%" })

        const swiperWrapper = $("<div>")
        swiperWrapper.addClass("swiper-wrapper")

        const swiperPagination = $("<div>")
        swiperPagination.addClass("swiper-pagination")

        const swiperBtnPrev = $("<div>")
        swiperBtnPrev.addClass("swiper-button-prev")

        const swiperBtnNext = $("<div>")
        swiperBtnNext.addClass("swiper-button-next")

        const swiperScrollbar = $("<div>")
        swiperScrollbar.addClass("swiper-scrollbar")

        swiperEl.append(swiperWrapper, swiperPagination, swiperBtnPrev, swiperBtnNext, swiperScrollbar)

        instance.canvas.append(swiperEl)


        // Initialize Swiper with some default properties
        const swiper = new WonderfulSwiper(swiperEl.get(0), {
            //cssMode: true,
            speed: 10000,
            zoom: true,
            effect: effect,
            // Optional parameters
            freeMode: {
                enabled: false,
                sticky: false
            },
            

            // If we need pagination
            pagination: {
                el: ".swiper-pagination",
            },

            // Navigation arrows
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },

            // And if we need scrollbar
            scrollbar: {
                el: ".swiper-scrollbar",
            },
            
            on: {
                update: function () {
                    instance.data.cSlides = [...this.slides];
                },
            }
        })
        
        swiper.el.addEventListener('swiperZoomIn', (event) => {});

        swiper.el.addEventListener('swiperZoomOut', (event) => {});
        
        swiper.on('zoomChange', (swiper, scale, imageEl, slideEl) => {});
        
        swiper.on('init', () => {
        	if (cb) cb()
        })
        
        swiper.on('update', () => {
        	//instance.publishState('image_list', Object.values(instance.data.slides).map(v => v.originalImage))
        })

        // Attaching events to created swiper
        swiper.on("slideChange", function () {
            instance.publishState("active_index", this.realIndex + 1)
        })

        swiper.on("doubleClick", function () {
            const idx = instance.data.cSlides.indexOf(this.clickedSlide); //Number($(this.clickedSlide).attr("aria-label").match(/\d/)[0]);
            instance.publishState("double_clicked_index", idx + 1)
            instance.publishState('double_clicked_index_image', instance.data.originalSource[idx])
            instance.triggerEvent("a_slide_double_clicked")
        })

        swiper.on("click", function () {
            const idx = instance.data.cSlides.indexOf(this.clickedSlide); //Number($(this.clickedSlide).attr("aria-label").match(/\d/)[0]);
            instance.publishState("clicked_index", idx + 1);
            instance.publishState('clicked_index_image', instance.data.originalSource[idx])
            instance.triggerEvent("a_slide_clicked")
        })

        swiperEl.on("mouseover", () => {
            if (instance.data.stoponhover) swiper.autoplay.stop()
        })

        swiperEl.on("mouseleave", () => {
            if (instance.data.stoponhover && instance.data.autoplay && !instance.data.stoponinteract) swiper.autoplay.start()
        })
        
        swiper.on('resize', function () {})

        // Store all stuff in "data" object for further operations
        instance.data.slides = {}
        instance.data.swiperEl = swiperEl
        instance.data.swiperWrapper = swiperWrapper
        instance.data.swiperBtnPrev = swiperBtnPrev
        instance.data.swiperBtnNext = swiperBtnNext
        instance.data.swiperPagination = swiperPagination
        instance.data.swiperScrollbar = swiperScrollbar
        instance.data.swiper = swiper
        instance.data.effect = effect
    }
    
    initSwiper();
    
    instance.data.initSwiper = initSwiper
    
    
    instance.data.arraysEqual = function (arr1, arr2) {
        // Check if the arrays have the same length
        if (arr1.length !== arr2.length) {
            return false;
        }

        // Check if all elements in the arrays are equal
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        // If we reach this point, the arrays are equal
        return true;
    }
}