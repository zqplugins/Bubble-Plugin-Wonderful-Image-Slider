function(instance, properties, context) {
	if (!instance.data.swiper) return;

    try {
        instance.data.swiper.zoom.in(properties.scale);
    } catch (e) {
        context.reportDebugger(`🔴 SLIDER ERROR: ${e.message}`);
    }
}