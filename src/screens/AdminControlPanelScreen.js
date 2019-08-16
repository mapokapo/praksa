import React, { Component } from "react";
import { View, Text, RefreshControl, FlatList, StatusBar } from "react-native";
import { Icon, SearchBar, ListItem } from "react-native-elements";
import firebase from "react-native-firebase";
import { NavigationEvents } from "react-navigation";

export default class AdminControlPanelScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      userList: [],
      loading: true,
      userData: "",
      user: "",
      getUser: firebase.functions().httpsCallable("getUser")
    }
    this._isMounted = false;
  }

  static navigationOptions = {
    header: null
  };

  componentDidMount = () => {
    this._isMounted = true;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  fetchUsers = () => {
    if (this._isMounted)
      firebase.database().ref("users/").on("value", async snapshot => {
        if (!snapshot.val() || !this._isMounted)
          return;
        let userArray = [];
        let userObj = snapshot.val();
        for (let key of Object.keys(userObj)) {
          await new Promise((resolve, reject) => {
            this.state.getUser({ uid: key }).then(userRecord => {
              if (this._isMounted)
                resolve(userRecord.data);
              else reject();
            }).catch(error => {
              alert(error);
              reject();
            });
          }).then(async data => {
            await firebase.database().ref("users/").child(key).once("value", ss => {
              if (!ss.val() || !this._isMounted)
                return;
              userObj[key].admin = ss.val().admin;
              userObj[key].emailVerified = data.emailVerified;
              userObj[key].email = data.email;
            });
          });
        }
        userArray = Object.values(userObj);
        this.setState({ userList: userArray }, () => {
          this.setState({ loading: false });
        })
      });
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({ item }) =>
    <ListItem
      onPress={() => {
        this.props.navigation.navigate("UserPanel", { userData: item });
      }}
      containerStyle={{ margin: 3, borderRadius: 5, padding: 10 }}
      title={item.displayName}
      titleStyle={{ fontSize: 18 }}
      subtitle={
        <View>
          <Text style={{ color: "#444" }}>Joined on {item.joined}</Text>
        </View>
      }
      rightSubtitle={
        <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
          {item.admin === 1 && <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}><Icon type="material" size={20} color="#9b59b6" name="grade" /><Text numberOfLines={1} style={{ color: "#333" }}>Admin</Text></View>}
          {item.emailVerified && <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}><Icon type="material" size={18} color="#27ae60" name="verified-user" /><Text numberOfLines={1} style={{ color: "#333" }}>Verified</Text></View>}
        </View>
      }
      rightContentContainerStyle={{ display: "flex", flex: 1, flexDirection: "row", justifyContent: "flex-start" }}
      leftAvatar={{ source: { uri: item.imageURL }, size: "medium" }}
    />

  updateSearch = search => {
    this.setState({ search }, () => {
      firebase.database().ref("users/").orderByChild("displayName").startAt(search.toUpperCase()).endAt(search.toLowerCase()+"\uf8ff").once("value", snapshot => {
        if (snapshot.val()) {
          this.setState({ list: Object.values(snapshot.val()) });
        }
      });
    });
  };

  render() {
    return (
      <View style={{ backgroundColor: "#065471", flex: 1 }}>
        <StatusBar backgroundColor="#065471" barStyle="light-content" />
        <NavigationEvents
          onDidFocus={() => {
            if (this._isMounted) {
              this.fetchUsers()
              this.setState({ user: this.props.navigation.getParam("user") , userData: this.props.navigation.getParam("userData") });
            }
          }}
        />
        <SearchBar
          lightTheme round
          placeholder="Search Users..."
          onChangeText={this.updateSearch}
          value={this.state.search}
          inputContainerStyle={{ backgroundColor: "#2980b9" }}
          inputStyle={{ color: "#fff" }}
          placeholderTextColor="#fff"
          searchIcon={<Icon type="material" name="search" color="#fff" />}
          containerStyle={{ backgroundColor: "#3498db", borderBottomColor: "transparent", borderTopColor: "transparent" }}
        />
        <FlatList
          style={{ margin: 3 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.fetchUsers}
            />
          }
          data={this.state.userList}
          extraData={this.state}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
      </View>
    );
  }
}
