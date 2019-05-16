export const toggleSidebar = function (force = false) {
	const $button = document.querySelector('#sidebar-toggler');
	if (!$button) {
		console.warn('button not found');
		return;
	}

	const $sidebar = document.querySelector(
		`#${$button.getAttribute("aria-controls")}`
	);
	if (!$sidebar) {
		console.warn('sidebar not found');
		return;
	}

	let hide = $button.getAttribute("aria-expanded") === "true";
	if (force) {
		if (force === 'show') {
			hide = false;
		} else if (force === 'hide') {
			hide = true;
		}
	}

	$sidebar.setAttribute("aria-hidden", hide ? "true" : "false");
	$button.setAttribute("aria-expanded", hide ? "false" : "true");
};
