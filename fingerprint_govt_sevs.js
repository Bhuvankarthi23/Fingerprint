async function getfingerprint() {
    const storedFingerprint = getCookie('fingerprint');
    if (storedFingerprint) {
        console.log("Fingerprint is already stored in cookie: "+storedFingerprint);
        return storedFingerprint["fingerprint"];
    }
    else {
        console.log("Default fingerprint 85e1293153c56349abd3530e3d16e6a3");
        return "85e1293153c56349abd3530e3d16e6a3";
    }
}

function setCookie(name, value, days) {
    const expires = new Date();
    value = JSON.stringify(value)
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function postData(rawdata){
    fetch('https://192.168.50.115:8000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rawdata),
    })
    .then(response => {
        return response.json()
    })
    .then(data => {
        console.log('Response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getData(visitor_id){
    fetch(`https://192.168.50.115:8000/?refresh_fingerprint=${visitor_id}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        return data[0]
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// async function checkAndUpdateFingerprint() {
//     const FingerprintJS = await import('https://openfpcdn.io/fingerprintjs/v4');
//     const fp = await FingerprintJS.load();
//     const result = await fp.get();
//     const visitorId = result.visitorId;

//     const storedFingerprint = getCookie('fingerprint');
//     if (storedFingerprint) {
//         if (visitorId !== storedFingerprint) {
//             // Fingerprint has changed, update the cookie
//             setCookie('fingerprint', visitorId, 365);
//             console.log("Updated id to: "+visitorId);
//         }
//     }
//     else {
//         setCookie('fingerprint', visitorId, 365);
//         console.log("Fingerprint saved in cookie: "+visitorId);
//     }
// }
async function checkAndUpdateFingerprint() {
    const FingerprintJS = await import('https://openfpcdn.io/fingerprintjs/v4');
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const visitorId = result.visitorId;
    const storedFingerprint = getCookie('fingerprint');
    

    if (storedFingerprint) {
        spfprint = JSON.parse(storedFingerprint)
        if (visitorId !== spfprint["refresh_fingerprint"]) {
            let value = {
                "refresh_fingerprint" : visitorId,
                "fingerprint" : spfprint["fingerprint"]
            }
            setCookie('fingerprint', value, 365);
            postData(value)
            console.log(" id to: "+value["refresh_fingerprint"]);
        }
    }
    else {
        let value = {}
        value = getData(visitorId)
        if (!value){          
            value = {
                "refresh_fingerprint" : visitorId,
                "fingerprint" : visitorId
            }
            setCookie('fingerprint', value, 365);
            postData(value)           
        }
        setCookie('fingerprint', value, 365);
        console.log("Fingerprint saved in cookie: "+value["fingerprint"]);
    }
}