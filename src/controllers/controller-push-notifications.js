export class ControllerPushNotifications {
	constructor(state, api) {
		this.state = state;
		this.api = api;
	}

	SetStatus(status, message, enabled = this.state.push.enabled) {
		this.state.push = {
			...this.state.push,
			status,
			message,
			enabled,
			supported: this.api.supported,
			permission: 'Notification' in window ? Notification.permission : 'unsupported'
		};
	}

	async RefreshStatus() {
		if(!this.api.supported) {
			this.SetStatus('unsupported', 'Push notifications are not supported by this browser.', false);
			return;
		}

		try {
			const subscription = await this.api.GetSubscription();
			this.SetStatus(
				subscription ? 'enabled' : 'disabled',
				subscription ? 'AI Queue notifications are enabled.' : 'AI Queue notifications are disabled.',
				Boolean(subscription)
			);
		} catch (error) {
			this.SetStatus('error', error.message || 'Unable to inspect push notification status.', false);
		}
	}

	async Enable() {
		this.SetStatus('working', 'Enabling AI Queue notifications...');
		try {
			await this.api.Enable();
			this.SetStatus('enabled', 'AI Queue notifications are enabled.', true);
		} catch (error) {
			console.error('[SubZeta Push]', 'Enable failed.', error);
			this.SetStatus('error', error.message || 'Unable to enable AI Queue notifications.', false);
		}
	}

	async Disable() {
		this.SetStatus('working', 'Disabling AI Queue notifications...');
		try {
			await this.api.Disable();
			this.SetStatus('disabled', 'AI Queue notifications are disabled.', false);
		} catch (error) {
			this.SetStatus('error', error.message || 'Unable to disable AI Queue notifications.');
		}
	}

	async SendTest() {
		this.SetStatus('working', 'Sending a test notification...');
		try {
			await this.api.SendTest();
			this.SetStatus('enabled', 'Test notification sent.', true);
		} catch (error) {
			this.SetStatus('error', error.message || 'Unable to send a test notification.');
		}
	}
}
