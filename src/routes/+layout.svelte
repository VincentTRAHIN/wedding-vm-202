<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		Menu,
		User,
		Home,
		CalendarCheck,
		Image,
		Settings,
		LogOut,
		CalendarDays,
		LayoutDashboard
	} from 'lucide-svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { cn } from '$lib/utils';

	let { children, data } = $props();
	let { supabase, session, userRole } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	let isMobileMenuOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Accueil', icon: Home },
		{ href: '/programme', label: 'Programme', icon: CalendarDays },
		{ href: '/rsvp', label: 'RSVP', icon: CalendarCheck },
		{ href: '/gallery', label: 'Galerie', icon: Image }
	];

	const adminItem = { href: '/admin/guests', label: 'Admin', icon: Settings };
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Mariage V&M 2026</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background font-sans text-foreground">
	<header
		class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<Sheet.Root bind:open={isMobileMenuOpen}>
					<Sheet.Trigger
						class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
					>
						<Menu class="h-5 w-5" />
						<span class="sr-only">Menu</span>
					</Sheet.Trigger>
					<Sheet.Content side="left" class="w-[250px] sm:w-[300px]">
						<Sheet.Header>
							<Sheet.Title class="font-serif text-xl text-primary">V&M 2026</Sheet.Title>
						</Sheet.Header>
						<nav class="mt-6 flex flex-col gap-4">
							{#each navItems as item (item.href)}
								<a
									href={item.href}
									class="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary {$page
										.url.pathname === item.href
										? 'text-primary'
										: 'text-muted-foreground'}"
									onclick={() => (isMobileMenuOpen = false)}
								>
									<item.icon class="h-5 w-5" />
									{item.label}
								</a>
							{/each}
							{#if session}
								<a
									href="/dashboard"
									class="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary {$page
										.url.pathname === '/dashboard'
										? 'text-primary'
										: 'text-muted-foreground'}"
									onclick={() => (isMobileMenuOpen = false)}
								>
									<LayoutDashboard class="h-5 w-5" />
									Mon Espace
								</a>
							{/if}
							{#if userRole === 'admin'}
								<a
									href={adminItem.href}
									class="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary {$page.url.pathname.startsWith(
										'/admin'
									)
										? 'text-primary'
										: 'text-muted-foreground'}"
									onclick={() => (isMobileMenuOpen = false)}
								>
									<adminItem.icon class="h-5 w-5" />
									{adminItem.label}
								</a>
							{/if}
						</nav>
					</Sheet.Content>
				</Sheet.Root>

				<a href="/" class="flex items-center gap-2">
					<span class="hidden font-serif text-xl font-bold text-primary md:inline-block"
						>V&M 2026</span
					>
					<span class="font-serif text-xl font-bold text-primary md:hidden">V&M</span>
				</a>
			</div>

			<nav class="hidden md:flex md:items-center md:gap-6">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="text-sm font-medium transition-colors hover:text-primary {$page.url.pathname ===
						item.href
							? 'text-primary'
							: 'text-muted-foreground'}"
					>
						{item.label}
					</a>
				{/each}
				{#if session}
					<a
						href="/dashboard"
						class="text-sm font-medium transition-colors hover:text-primary {$page.url.pathname ===
						'/dashboard'
							? 'text-primary'
							: 'text-muted-foreground'}"
					>
						Mon Espace
					</a>
				{/if}
				{#if userRole === 'admin'}
					<a
						href={adminItem.href}
						class="text-sm font-medium transition-colors hover:text-primary {$page.url.pathname.startsWith(
							'/admin'
						)
							? 'text-primary'
							: 'text-muted-foreground'}"
					>
						{adminItem.label}
					</a>
				{/if}
			</nav>

			<div class="flex items-center gap-2">
				{#if session}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'rounded-full')}
						>
							<User class="h-5 w-5" />
							<span class="sr-only">Compte</span>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Label>Mon Compte</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<a href="/dashboard" class="contents">
								<DropdownMenu.Item>
									<LayoutDashboard class="mr-2 h-4 w-4" />
									<span>Mon Espace</span>
								</DropdownMenu.Item>
							</a>
							<DropdownMenu.Separator />
							<a href="/logout" class="contents">
								<DropdownMenu.Item class="text-destructive focus:text-destructive">
									<LogOut class="mr-2 h-4 w-4" />
									<span>Se déconnecter</span>
								</DropdownMenu.Item>
							</a>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button href="/login" variant="default" size="sm">Se connecter</Button>
				{/if}
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t py-6 md:py-0">
		<div class="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
			<p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
				&copy; 2026 Vincent & Mélanie. Fait avec ❤️.
			</p>
		</div>
	</footer>
</div>

<Toaster />
