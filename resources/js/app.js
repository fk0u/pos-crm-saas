import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';

const appElement = document.getElementById('app');

if (appElement && appElement.dataset.page) {
    createInertiaApp({
        resolve: name => {
            const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
            const page = pages[`./Pages/${name}.vue`];
            if (!page) {
                throw new Error(`Page not found: ./Pages/${name}.vue`);
            }
            return page;
        },
        setup({ el, App, props, plugin }) {
            createApp({ render: () => h(App, props) })
                .use(plugin)
                .mount(el);
        },
    });
} else {
    // Fallback for non-Inertia legacy entrypoints if any
    if (document.getElementById('pos-terminal-app')) {
        import('./pos/main.js');
    }
    if (document.getElementById('live-monitoring-app')) {
        import('./dashboard.js');
    }
}
