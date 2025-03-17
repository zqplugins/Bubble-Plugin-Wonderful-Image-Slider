function(instance, properties, context) {
    if (!instance.data.swiper) return;

    try {
        instance.data.swiper.slideToLoop(properties.index - 1);
    } catch (e) {
        context.reportDebugger(`🔴 SLIDER ERROR: ${e.message}`);
    }
}