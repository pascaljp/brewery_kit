import {execSync} from 'child_process';
import firebase from 'firebase';

class Admin {
  constructor() {
    firebase.initializeApp({
      apiKey: 'AIzaSyBT6_J6eKuV1gX5zJZQHMyCsb4LSxfi68Y',
      authDomain: 'brewery-kit.firebaseapp.com',
      databaseURL: 'https://brewery-kit-dev.firebaseio.com',
      projectId: 'brewery-kit',
      storageBucket: 'brewery-kit.appspot.com',
      messagingSenderId: '567787916313',
      appId: '1:567787916313:web:b31c427a013911da88ee88',
    });

    const reqRoot = firebase.database().ref('admin/testMachine/request');
    const resRoot = firebase.database().ref('admin/testMachine/response');

    const callback = async (snapshot: firebase.database.DataSnapshot) => {
      const command = snapshot.val();
      console.log(command);
      try {
        const result = execSync(command + ' 2>/dev/null').toString();
        const o: {[key: string]: any} = {};
          const key = snapshot.key as string;
        o[key] = result;
        await resRoot.update(o);
      } catch (e) {
        console.log(e.stdout.toString());
        console.warn(e.stderr.toString());
      }
    };

    reqRoot.orderByKey().limitToLast(1).once('value').then((snapshot) => {
      const lastChild = Object.entries(snapshot.val())[0];
      const lastKey = lastChild ? lastChild[0] : '';
      reqRoot.orderByKey().startAfter(lastKey).on('child_added', callback);
      reqRoot.orderByKey().startAfter(lastKey).on('child_changed', callback);
    });
  }
}

export {Admin};
