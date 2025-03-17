function(instance, properties, context) { // Wonderful Image Slider -> Wonderful Image Slider V2 -> update
    // Destructuring properties for easy use of variables
    const {
        keyboard,
        mousewheel,
        disable_autoplay,
        autoplay,
        free_mode,
        centered,
    	scroll_bar,
        pagination,
        navigation,
        ptype,
        pclickable,
        slides_per_view,
        direction,
        loop,
        hide_scroll_bar,
        alt_list,
        url_list,
        text_list,
        alt_img_list,
        image_list,
        space_between,
        object_fit,
        grab_cursor,
        defaultImage,
        text_shadow_color,
        text_shadow_spec,
        text_top,
        text_left,
        element_width,
        element_height,
        element_margin,
        element_border_radius,
        element_background,
        element_border_width,
        element_border_style,
        element_border_color,
        arrow_color,
        arrows_shadow_spec,
        arrows_shadow_color,
        dots_color,
        dots_color_inactive,
        dots_shadow_spec,
        dots_shadow_color,
        redeye,
        format,
        enhance,
        compress,
        quality,
        manualquality,
        fit,
        dpr,
        imgixh,
        imgixw,
        useimgix,
        arrows_size,
        arrow_wrapper_size,
        swipe_speed,
        disable_autoplay_on_hover,
        lazy,
        effect,
        zoom,
        arrows_border_radius,
        arrows_background,
        text_background
    } = properties
    
    // Destructuring "data" object that contain all initialized stuff from the "initialize" function
    let { swiper, swiperBtnPrev, swiperBtnNext, swiperPagination, swiperScrollbar, slides, resizeTimer, initSwiper, arraysEqual } = instance.data
    
    instance.canvas.css('--slider-img-bg', element_background);
    
    function initCallback() {
        // Load resources for slider
        const sImages = (image_list ? image_list.get(0, image_list.length()) : []).filter(link => !!link);
        const sAltImages = alt_img_list ? alt_img_list.get(0, alt_img_list.length()) : []
        const sTextes = text_list ? text_list.get(0, text_list.length()) : []
        const sUrls = url_list ? url_list.get(0, url_list.length()) : []
        const sAlts = alt_list ? alt_list.get(0, alt_list.length()) : []
        
        // Slider options
        swiper.params.slidesPerView = slides_per_view
        swiper.params.centeredSlides = centered
        swiper.params.freeMode.enabled = free_mode
        swiper.params.loop = loop
        
        //swiper.params.zoom = zoom
        if (zoom) swiper.zoom.enable()
        else swiper.zoom.disable()
        
        swiper.params.speed = swipe_speed
        instance.data.autoplay = autoplay
        instance.data.stoponhover = disable_autoplay_on_hover
        instance.data.stoponinteract = disable_autoplay
        swiper.params.autoplay = { delay: autoplay, disableOnInteraction: disable_autoplay }
        instance.data.lazy = lazy
        instance.data.zoom = zoom

        if (!!autoplay) {
            swiper.autoplay.start()
        } else {
            swiper.autoplay.stop()
        }

        if (!!keyboard) swiper.keyboard.enable()
        else swiper.keyboard.disable()

        if (!!mousewheel) swiper.mousewheel.enable()
        else swiper.mousewheel.disable()

        swiper.params.spaceBetween = +space_between
        swiper.params.grabCursor = grab_cursor
        swiper.params.scrollbar.hide = hide_scroll_bar
        swiper.changeDirection(direction.toLowerCase())
        swiper.params.initialSlide = 2
        
        // Make swiper additional elements invisible by default
        swiperPagination.css("visibility", "hidden")
        swiperBtnPrev.css({
            visibility: 'hidden',
        	background: arrows_background || 'transparent',
            borderRadius: arrows_border_radius + 'px',
            width: (arrow_wrapper_size || 50) + 'px',
            height: (arrow_wrapper_size || 50) + 'px'
        })
        swiperBtnNext.css({
            visibility: 'hidden',
        	background: arrows_background || 'transparent',
            borderRadius: arrows_border_radius + 'px',
            width: (arrow_wrapper_size || 50) + 'px',
            height: (arrow_wrapper_size || 50) + 'px'
        })
        swiperScrollbar.css("visibility", "hidden")

        var navBtnsCss = document.createElement("style");
        navBtnsCss.innerHTML = `[aria-controls="${swiper.wrapperEl.id}"]:after { font-size: ${arrows_size || 44}px; }`;
        document.head.appendChild(navBtnsCss);

        swiper.pagination.destroy()
        
        
        // Navigation options
        if (navigation) {
            swiperBtnPrev.add(swiperBtnNext).css({
                visibility: "visible",
                color: arrow_color,
                textShadow: `${arrows_shadow_spec} ${arrows_shadow_color}`
            })
        }

        if (scroll_bar) swiperScrollbar.css("visibility", "visible")

        if (pagination) {
            swiperPagination.css("visibility", "visible")
            swiperPagination.css('--swiper-pagination-color', dots_color);
            swiperPagination.css('--swiper-pagination-bullet-inactive-color', dots_color_inactive);
            swiperPagination.find(".swiper-pagination-bullet").css({
                boxShadow: `${dots_shadow_spec} ${dots_shadow_color}`
            })
            swiper.params.pagination.type = ptype.toLowerCase()
            swiper.params.pagination.clickable = pclickable
            swiper.pagination.init()
            swiper.pagination.update()
        }
        
        if (
            arraysEqual(instance.data.originalSource, sImages)
            && arraysEqual(instance.data.originalAltImages, sAltImages)
            && arraysEqual(instance.data.originalTextes, sTextes)
            && arraysEqual(instance.data.originalUrls, sUrls)
            && arraysEqual(instance.data.originalAlts, sAlts)
        ) {
            return;
        }
        
        instance.data.originalSource = sImages
        instance.data.originalAltImages = sAltImages
        instance.data.originalTextes = sTextes
		instance.data.originalUrls = sUrls
        instance.data.originalAlts = sAlts
        
        // Remove previous unused slides (keeping current slide active if possible without performance issues)
        //const toRemoveKeys = Object.keys(slides).filter(key => !sImages.includes(key.split('*+')[0]))
        //const toRemove = toRemoveKeys.map(key => +key.split('*+')[1])
        //
        //if (toRemove.length) {
        //    toRemoveKeys.forEach(key => delete slides[key])
        //    swiper.removeSlide(toRemove)
        //}

        if (Object.keys(slides).length) {
            swiper.removeAllSlides()
            slides = {}
        }
        
        

        // Here we build an object that will contain all our added slides
        sImages.forEach((img, i) => {
            if (!slides[img + i]) slides[img + i] = {
                originalImage: img,
                image: useimgix ? swiper.applyImgix(img, { redeye, format, enhance, compress, quality, manualquality, fit, dpr, imgixh, imgixw }) : img,
                altImage: useimgix ? swiper.applyImgix(sAltImages[i], { redeye, format, enhance, compress, quality, manualquality, fit, dpr, imgixh, imgixw }) : sAltImages[i],
                text: sTextes[i],
                url: sUrls[i],
                alt: sAlts[i]
            }
        })

        // Here slides are added to slider
        async function renderSlides () {
            instance.publishState('loading', true);
            const promises = Object.values(slides).map((slide, i) => {
                
                if (!slide.rendered) {
                    const promise = swiper.appendGenericSlide({
                        open: true,
                        defaultImage,
                        text_top,
                        text_left,
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
                        text_background,
                        ...slide
                    })
                    slide.rendered = true
                    return promise;
                }
                return null;
            }).filter(promise => promise !== null);
            
            await Promise.all(promises);
            
            instance.publishState('loading', false);
            instance.triggerEvent('slides_loaded');
        }
        
        renderSlides();

		instance.publishState('image_list', sImages)

        // We need to update params and update the slider each time an update recieved

        swiper.update()
        
        instance.data.initedUpdate = true;
    }
    
    if (effect !== instance.data.effect) {
    	swiper.destroy(true, true)
        initSwiper(effect, initCallback)
        return
    }
    
    
    initCallback()
}