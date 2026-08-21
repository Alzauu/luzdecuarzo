/**
 * Acción de Svelte que agrega la clase `in-view` a un elemento cuando
 * entra en el viewport, disparando la animación de aparición definida
 * en app.css para los elementos con el atributo `data-reveal`.
 *
 * Uso:
 *   <div data-reveal use:reveal>...</div>
 *
 * Se puede combinar con `style="transition-delay: {i * 100}ms"` para
 * escalonar la animación en listas/grillas.
 */
export function reveal(node: HTMLElement) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('in-view');
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -40px 0px'}
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}