<script lang="ts">
    import {Navbar, NavBrand, NavHamburger, NavLi, NavUl} from "flowbite-svelte";
    import DarkModeButton from "$lib/components/DarkModeButton.svelte";
    import { page } from '$app/state';
    import { afterNavigate } from '$app/navigation';
    import { twMerge } from "tailwind-merge";
    import type {Snippet} from "svelte";

    interface Props {
        shouldFixNavbar?: 'true' | 'false' | undefined;
        title?: Snippet | undefined;
        fillNarrow?: boolean;
        class?: string | undefined;
        bgClass?: string | undefined;
        bgClassUl?: string | undefined;
    }
    const bgClassDefault = 'bg-white dark:bg-gray-800';

    let { shouldFixNavbar = undefined, title, fillNarrow, class: propsClass, bgClass = bgClassDefault, bgClassUl = bgClass }: Props = $props();
    let fixedNavbar = $derived(shouldFixNavbar !== undefined ? (shouldFixNavbar === 'true') : (page.data.header?.fixedNavbar ?? false));
    let fixedProps = 'w-full px-2 py-2.5 sm:px-4 fixed z-50 top-0';
    let activeUrl = $derived.by(() => {
        const topLevelSegment = page.url.pathname.split('/')[1];
        return topLevelSegment ? `/${topLevelSegment}/` : '/';
    });

    // flowbite-svelte's NavUl sets these on navState only via $effect, which doesn't run
    // during SSR. Passing them as props to NavLi makes them available immediately,
    // preventing the black flash on initial page load (NavLi prefers the prop over context).
    const activeNavClass = "text-white bg-primary-700 dark:bg-primary-600 md:bg-transparent md:text-primary-700 md:dark:text-white md:dark:bg-transparent";
    const nonActiveNavClass = "hover:text-primary-500 text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:border-0 md:hover:text-primary-700 dark:md:text-gray-400 md:dark:hover:text-white md:dark:hover:bg-transparent";

    // Track state to close navbar after navigation
    let closeDropdownAction: (() => void) | undefined = $state();

    afterNavigate(() => {
        if (closeDropdownAction) {
            closeDropdownAction();
        }
    });

    const bindCloseAction = (node: HTMLElement, params: { hidden: boolean, toggle: () => void }) => {
        closeDropdownAction = () => {
            if (!params.hidden && params.toggle) {
                params.toggle();
            }
        };
        return {
            update(newParams: { hidden: boolean, toggle: () => void }) {
                closeDropdownAction = () => {
                    if (!newParams.hidden && newParams.toggle) {
                        newParams.toggle();
                    }
                };
            },
            destroy() {
                if (closeDropdownAction === params.toggle) { // just to clear it roughly
                    closeDropdownAction = undefined;
                }
            }
        };
    };
</script>

<Navbar class={twMerge(`${fillNarrow ? '' : bgClass} ${fixedNavbar ? fixedProps : 'relative'}`, propsClass)}>
    {#snippet children({ hidden, toggle })}
        <NavBrand href="/">
            {#if title}
                {@render title()}
            {:else}
                <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Mykola Morozov</span>
            {/if}
        </NavBrand>
        <div class="flex md:order-2">
            <DarkModeButton class={fillNarrow ? bgClass : ''} />
            <NavHamburger class={fillNarrow ? bgClass : ''} />
        </div>

        <!-- invisible tracker specifically for connecting the auto-close state -->
        <span class="hidden" use:bindCloseAction={{ hidden, toggle }}></span>

        <NavUl
            {activeUrl}
            onclick={() => { if (!hidden) toggle(); }}
            classes={{ ul: `md:space-x-8 md:mt-0 md:text-sm ${fillNarrow ? bgClassUl : ''}` }}
        >
            <NavLi class="md:p-0 rounded-sm" href="/" activeClass={activeNavClass} nonActiveClass={nonActiveNavClass}>Home</NavLi>
            <NavLi class="md:p-0 rounded-sm" href="/resume/" activeClass={activeNavClass} nonActiveClass={nonActiveNavClass}>Résumé</NavLi>
            <NavLi class="md:p-0 rounded-sm" href="/projects/" activeClass={activeNavClass} nonActiveClass={nonActiveNavClass}>Projects</NavLi>
            <NavLi class="md:p-0 rounded-sm" href="/blog/" activeClass={activeNavClass} nonActiveClass={nonActiveNavClass}>Blog</NavLi>
            <NavLi class="md:p-0 rounded-sm" href="/#contact" nonActiveClass={nonActiveNavClass}>Contact</NavLi>
        </NavUl>
    {/snippet}
</Navbar>