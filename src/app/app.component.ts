// Angular
import { Component } from '@angular/core';

// Ionic
import { Platform, AlertController } from 'ionic-angular';

// Ionic Native
import { Firebase } from '@ionic-native/firebase';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Pages
import { HomePage } from '../pages/home/home';

export class NotificationModel {
	public body: string;
	public title: string;
	public tap: boolean
}

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	rootPage: any = HomePage;

	constructor(private platform: Platform,
		private alertCtrl: AlertController,
		private firebase: Firebase,
		private statusBar: StatusBar,
		private splashScreen: SplashScreen) {

		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();

			if (this.platform.is('cordova')) {
				// Initialize push notification feature
				this.platform.is('android') ? this.initializeFireBaseAndroid() : this.initializeFireBaseIos();
			} else {
				console.log('Push notifications are not enabled since this is not a real device');
			}
		});
	}

	private initializeFireBaseAndroid(): Promise<any> {
		return this.firebase.getToken()
			.catch(error => console.error('Error getting token', error))
			.then(token => {

				console.log(`The token is ${token}`);

				Promise.all([
					this.firebase.subscribe('firebase-app'), 	// Subscribe to the entire app
					this.firebase.subscribe('android'),			// Subscribe to android users topic
					this.firebase.subscribe('userid-1') 		// Subscribe using the user id (hardcoded in this example)
				]).then((result) => {
					if (result[0]) console.log(`Subscribed to FirebaseDemo`);
					if (result[1]) console.log(`Subscribed to Android`);
					if (result[2]) console.log(`Subscribed as User`);

					this.subscribeToPushNotificationEvents();
				});
			});
	}

	private initializeFireBaseIos(): Promise<any> {
		return this.firebase.grantPermission()
			.catch(error => console.error('Error getting permission', error))
			.then(() => {
				this.firebase.getToken()
					.catch(error => console.error('Error getting token', error))
					.then(token => {

						console.log(`The token is ${token}`);

						Promise.all([
							this.firebase.subscribe('firebase-app'),
							this.firebase.subscribe('ios'),
							this.firebase.subscribe('userid-2')
						]).then((result) => {

							if (result[0]) console.log(`Subscribed to FirebaseDemo`);
							if (result[1]) console.log(`Subscribed to iOS`);
							if (result[2]) console.log(`Subscribed as User`);

							this.subscribeToPushNotificationEvents();
						});
					});
			})

	}

	private saveToken(token: any): Promise<any> {
		// Send the token to the server
		console.log('Sending token to the server...');
		return Promise.resolve(true);
	}

	private subscribeToPushNotificationEvents(): void {

		// Handle token refresh
		this.firebase.onTokenRefresh().subscribe(
			token => {
				console.log(`The new token is ${token}`);
				this.saveToken(token);
			},
			error => {
				console.error('Error refreshing token', error);
			});

		// Handle incoming notifications
		this.firebase.onNotificationOpen().subscribe(
			(notification: NotificationModel) => {

				!notification.tap
					? console.log('The user was using the app when the notification arrived...')
					: console.log('The app was closed when the notification arrived...');

				let notificationAlert = this.alertCtrl.create({
					title: notification.title,
					message: notification.body,
					buttons: ['Ok']
				});
				notificationAlert.present();
			},
			error => {
				console.error('Error getting the notification', error);
			});
	}
}
