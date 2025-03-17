function(instance, properties, context) {
    if (!instance.data.swiper) return;

    try {
        instance.data.swiper.slidePrev();
    } catch (e) {
        context.reportDebugger(`🔴 SLIDER ERROR: ${e.message}`);
    }
}