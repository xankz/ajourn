import { shallowMount } from "@vue/test-utils";

import { store as $store } from "@/store";
import Landing from "@/views/Landing.vue";

describe("Landing.vue", () => {
    it("renders empty when no journals", () => {
        const msg = "No journals available";
        const wrapper = shallowMount(Landing, {
            global: {
                plugins: [$store],
            },
        });
        expect(wrapper.text()).toContain(msg);
    });
});
