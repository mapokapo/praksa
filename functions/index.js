const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.getUser = functions.https.onCall((data, context) => {
  if (!context.auth) return {status: "error", code: 401, message: "Not signed in"}

  return new Promise((resolve, reject) => {
    // verify user"s rights
    admin.database().ref("users/").child(context.auth.uid).once("value", snapshot => {
      if (snapshot.val().admin === 1) {
        // query user data
        admin.auth().getUser(data.uid)
          .then(userRecord => {
            let obj = userRecord;
            delete obj.passwordHash;
            resolve(obj.toJSON());
          })
          .catch(error => {
            console.error("Error fetching user data:", error)
            reject({status: "error", code: 500, error})
          })
      } else {
        reject({status: "error", code: 403, message: "Forbidden"})
      }
    })
  })
})