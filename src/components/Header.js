import React, { Component, Fragment } from "react";
import { View, Text, Image, Alert } from "react-native";
import { Icon } from "react-native-elements";
import firebase from "react-native-firebase";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      userPanel: null,
      viewedUserData: null,
      deleteUser: firebase.functions().httpsCallable("deleteUser")
    }
    this._isMounted = false;
  }

  componentDidMount = async () => {
    this._isMounted = true;
    if (this.props.profile) {
      this.setState({ profile: this.props.profile });
    }
    if (this.props.userPanel && this.props.userData) {
      this.setState({ userPanel: this.props.userPanel, viewedUserData: this.props.userData });
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  render() {
    return (
      <View style={{ backgroundColor: "#3498db", height: 60, display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", position: "relative", paddingVertical: 33.25 }}>
        {this.state.userPanel !== null && this.state.profile === null &&
          (
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
              <Icon containerStyle={{ marginHorizontal: 10, width: 27, height: 27 }} type="material" name="arrow-back" size={27} color="#fff" onPress={() => this.props.back()} />
              <Image style={{ height: 46, width: 46, marginLeft: 6, borderRadius: 46 / 2 }} source={{ uri: this.state.viewedUserData.imageURL }} />
              <Text style={{ color: "#fff", fontSize: 24, fontFamily: "Montserrat-ExtraBold", marginLeft: 10 }}>{this.state.viewedUserData.displayName}</Text>
              <Icon color="#e74c3c" containerStyle={{ marginHorizontal: 10, marginLeft: "auto", width: 27, height: 27 }} type="material" name="delete" size={27} color="#fff" onPress={() => {
                Alert.alert(
                  "Confirm Deletion",
                  "Are you sure you want to delete this account?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Yes", onPress: () => {
                      this.state.deleteUser({uid: this.state.viewedUserData.uid}).then(() => {
                        firebase.storage().ref("profileImages/").child(this.state.viewedUserData.uid).delete().then(() => {
                          firebase.database().ref("users/").child(this.state.viewedUserData.uid).remove().then(() => {
                            this.props.navigation.navigate("AdminControlPanel");
                          });
                        }).catch(() => {
                          firebase.database().ref("users/").child(this.state.viewedUserData.uid).remove().then(() => {
                            this.props.navigation.navigate("AdminControlPanel");
                          });
                        });
                      }).catch(error => {
                        alert(error);
                      });
                    }}
                  ]
                )
              }} />
            </View>
          )
        }
        {this.state.profile !== null && this.state.userPanel === null &&
          (
            <Fragment>
              <Text style={{ color: "#fff", fontSize: 24, fontFamily: "Montserrat-ExtraBold", marginLeft: 15 }}>Profile</Text>
            </Fragment>
          )
        }
        {this.state.userPanel === null && this.state.profile === null &&
          (
            <Fragment>
              <Image style={{ height: 60, width: 60, marginLeft: 3 }} source={require("../../media/logo_circle.png")} />
              <Text style={{ color: "#fff", fontSize: 24, marginLeft: 3, fontFamily: "Montserrat-ExtraBold" }}>Gazer</Text>
            </Fragment>
          )
        }
      </View>
    )
  }
}