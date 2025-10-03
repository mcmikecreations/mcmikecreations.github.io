<script lang="ts">
    import { Card } from "flowbite-svelte";
    import type {ClassValue} from "svelte/elements";
    import {type ClassNameValue, twMerge} from "tailwind-merge";

    interface Props {
        x: number;
        y: number;
        href?: string | undefined;
        img?: string | undefined;
        children: any;
        class?: ClassNameValue;
    }

    let { x, y, img, href, children, class: classProps }: Props = $props();
    const horizontal = x > 1;
    const cardClass: ClassValue = "max-w-none min-w-[340px]" + (img ? "" : " p-4 sm:p-6 md:p-8");
    const divClass: ClassValue = img ? "m-6 flex-1" : "";
</script>

<Card {href} {horizontal} class={twMerge(cardClass, classProps)}>
    {#if img}
        <img width="100%" height="auto" class={twMerge("object-cover flex-1", horizontal ? "rounded-t-lg md:rounded-none md:rounded-l-lg" : "rounded-t-lg")} src={img} alt="project preview" />
    {/if}
    <div class={divClass}>
        {@render children?.()}
    </div>
</Card>
