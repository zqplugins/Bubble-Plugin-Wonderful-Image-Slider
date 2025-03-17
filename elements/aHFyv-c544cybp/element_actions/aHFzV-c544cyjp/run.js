function(instance, properties, context) {
	if (!instance.data.swiper) return;

    try {
        instance.data.swiper.update();
    } catch (e) {
        context.reportDebugger(`🔴 SLIDER ERROR: ${e.message}`);
    }
}