import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  FlatList,
  StatusBar,
  Picker,
  Dimensions
} from "react-native";
import {
  Icon,
  SearchBar,
  ListItem,
  Button,
  Overlay
} from "react-native-elements";
import firebase from "react-native-firebase";
import { NavigationEvents } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";

export default class ItemsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      list: [],
      loading: true,
      userData: "",
      user: "",
      getUser: firebase.functions().httpsCallable("getUser"),
      category: "All",
      modalVisible: false,
      categories: [
        "Automotive & Powersports",
        "Baby Products",
        "Beauty",
        "Books",
        "Camera & Photo",
        "Cell Phones & Accessories",
        "Collectible Coins",
        "Consumer Electronics",
        "Entertainment Collectibles",
        "Fine Art",
        "Grocery & Gourmet Food",
        "Health & Personal Care",
        "Home & Garden",
        "Independent Design",
        "Industrial & Scientific",
        "Major Appliances",
        "Music",
        "Musical Instruments",
        "Office Products",
        "Outdoors",
        "Personal Computers",
        "Pet Supplies",
        "Software",
        "Sports",
        "Sports Collectibles",
        "Tools & Home Improvement",
        "Toys & Games",
        "Video, DVD & Blu-ray",
        "Video Games",
        "Watches",
        "Other",
        "All"
      ]
    };
    this._isMounted = false;
  }

  static navigationOptions = {
    header: null
  };

  componentDidMount = () => {
    this._isMounted = true;
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchItems = callback => {
    if (this._isMounted) {
      let user = firebase.auth().currentUser;
      if (user && this._isMounted)
        firebase
          .database()
          .ref("users/")
          .child(user.uid)
          .once("value", snapshot => {
            if (snapshot.val() && this._isMounted)
              this.setState({ userData: snapshot.val(), user });
          });
      firebase
        .database()
        .ref("items/")
        .once("value", async snapshot => {
          if (!snapshot.val() || !this._isMounted) {
            this.setState({ loading: false, list: [] });
            return;
          }
          let itemArray = [];
          let itemObj = snapshot.val();
          let fetch = () =>
            new Promise((resolve, reject) => {
              for (let key of Object.keys(itemObj)) {
                this.state
                  .getUser({ uid: itemObj[key].added_by_uid })
                  .then(userRecord => {
                    firebase
                      .database()
                      .ref("users/")
                      .child(itemObj[key].added_by_uid)
                      .once("value", ss => {
                        if (!ss.val() || !this._isMounted) return;
                        itemObj[key].admin = ss.val().admin;
                        itemObj[key].emailVerified =
                          userRecord.data.emailVerified;
                      });
                  })
                  .catch(error => {
                    reject(error);
                  });
              }
              resolve();
            });
          fetch()
            .then(() => {
              if (this._isMounted) {
                itemArray = Object.values(itemObj);
                if (this.state.category !== "All") {
                  let self = this;
                  itemArray = itemArray.filter(item => {
                    return item.category === self.state.category
                  })
                }
                this.setState({ list: itemArray, loading: false }, () => {
                  if (callback) callback(itemArray);
                });
              }
            })
            .catch(() => {
              if (this._isMounted) {
                itemArray = Object.values(itemObj);
                if (this.state.category !== "All") {
                  let self = this;
                  itemArray = itemArray.filter(item => {
                    return item.category === self.state.category
                  })
                }
                this.setState({ list: itemArray }, () => {
                  if (callback) callback(itemArray);
                  this.setState({ loading: false });
                });
              }
            });
        });
    }
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item }) => (
    <ListItem
      onPress={() => {
        this.props.navigation.navigate("Item", {
          item,
          userData: this.state.userData
        });
      }}
      containerStyle={{ margin: 3, borderRadius: 5, padding: 10 }}
      title={item.title}
      titleStyle={{ fontSize: 18 }}
      subtitle={
        <View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#444" }}>Added by {item.added_by}</Text>
            {item.emailVerified && (
              <Icon
                containerStyle={{ marginLeft: 4 }}
                type="material"
                name="verified-user"
                color="#27ae60"
                size={15}
              />
            )}
            {item.admin === 1 && (
              <Icon type="material" name="grade" color="#9b59b6" size={17} />
            )}
          </View>
        </View>
      }
      rightSubtitle={
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center"
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            <Icon type="material" name="date-range" />
            <Text numberOfLines={1}>{item.added_on}</Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            <Icon type="material" name="location-on" color="#E84B3D" />
            <Text style={{ overflow: "hidden" }}>{item.location}</Text>
          </View>
        </View>
      }
      rightContentContainerStyle={{
        display: "flex",
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start"
      }}
      leftAvatar={{
        source: { uri: item.imageURL },
        size: "medium",
        avatarStyle: { backgroundColor: "#fff" }
      }}
    />
  );

  render() {
    const { search } = this.state;

    return (
      <View style={{ backgroundColor: "#065471", flex: 1 }}>
        <StatusBar backgroundColor="#065471" barStyle="light-content" />
        <NavigationEvents
          onDidFocus={async () => {
            await AsyncStorage.getItem("itemsList").then(item => {
              if (this._isMounted) {
                if (!item)
                  this.setState({ loading: true }, () => {
                    this.fetchItems(list => {
                      list.length !== 0
                        ? AsyncStorage.setItem(
                            "itemsList",
                            JSON.stringify(list)
                          )
                        : AsyncStorage.removeItem("itemsList");
                    });
                  });
                else {
                  this.setState({ list: JSON.parse(item), loading: false });
                }
              }
            });
          }}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#3498db"
          }}
        >
          <SearchBar
            lightTheme
            round
            placeholder="Search Items..."
            onChangeText={this.updateSearch}
            value={search}
            inputContainerStyle={{ backgroundColor: "#2980b9" }}
            inputStyle={{ color: "#fff" }}
            placeholderTextColor="#fff"
            searchIcon={<Icon type="material" name="search" color="#fff" />}
            containerStyle={{
              flexGrow: 1,
              backgroundColor: "#3498db",
              borderBottomColor: "transparent",
              borderTopColor: "transparent"
            }}
          />
          <Icon
            name="sort"
            type="material"
            color="#fff"
            size={24}
            containerStyle={{ marginHorizontal: 5, marginRight: 8 }}
            onPress={() => {
              this.setState({ modalVisible: true });
            }}
          />
        </View>
        <Overlay
          width={(Dimensions.get("window").width / 100) * 70}
          height="auto"
          isVisible={this.state.modalVisible}
          windowBackgroundColor="rgba(0, 0, 0, .25)"
          overlayBackgroundColor="#fff"
          overlayStyle={{ padding: 10, paddingVertical: 20 }}
          onBackdropPress={() => this.setState({ modalVisible: false })}
        >
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text>Order by category</Text>
            <Picker
              style={{
                padding: 5,
                paddingVertical: 30,
                width: "70%",
                height: "auto"
              }}
              selectedValue={this.state.category}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ category: itemValue })
              }>
              {this.state.categories.map(cat => {
                return <Picker.Item label={cat} value={cat} key={cat}  />
              })}
            </Picker>
            <Button
              buttonStyle={{ marginTop: 10 }}
              title="Done"
              titleStyle={{ marginHorizontal: 5 }}
              icon={
                <Icon
                  name="done"
                  type="material"
                  color="#fff"
                  iconStyle={{ marginHorizontal: 5 }}
                />
              }
              color="#0d0"
              onPress={async () => {
                this.setState({ modalVisible: false });
              }}
            />
          </View>
        </Overlay>
        <FlatList
          style={{ margin: 3 }}
          ListEmptyComponent={
            !this.state.loading && (
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 15
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#fff",
                    fontFamily: "Montserrat-ExtraBold"
                  }}
                >
                  There aren't any items here.
                </Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={() => {
                this.fetchItems(list => {
                  AsyncStorage.removeItem("itemsList").then(() => {
                    if (list.length !== 0) {
                      AsyncStorage.setItem(
                        "itemsList",
                        JSON.stringify(list)
                      ).then(() => {
                        this.setState({ list });
                      });
                    }
                  });
                });
              }}
            />
          }
          data={this.state.list}
          extraData={this.state}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
        {this.state.userData.admin === 1 && (
          <Button
            onPress={() => {
              this.props.navigation.navigate("AddItem");
            }}
            buttonStyle={styles.FloatingActionButton}
            icon={<Icon type="material" name="add" color="#222" size={35} />}
          />
        )}
      </View>
    );
  }

  updateSearch = search => {
    this.setState({ search }, () => {
      firebase
        .database()
        .ref("items/")
        .orderByChild("searchQuery")
        .startAt(search.toUpperCase())
        .endAt(search.toLowerCase() + "\uf8ff")
        .once("value", snapshot => {
          if (snapshot.val() && this._isMounted) {
            let itemArray = Object.values(snapshot.val());
            if (this.state.category !== "All") {
              let self = this;
              itemArray = itemArray.filter(item => {
                return item.category === self.state.category
              })
            }
            this.setState({ list: itemArray });
          }
        });
    });
  };

  _showMoreApp = () => {
    this.props.navigation.navigate("Home");
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f5fcff"
  },
  label: {
    flexGrow: 1,
    fontSize: 20,
    fontWeight: `600`,
    textAlign: `left`,
    marginVertical: 8,
    paddingVertical: 3,
    color: `#f5fcff`,
    backgroundColor: `transparent`
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 130,
    height: 40,
    marginTop: 40,
    borderRadius: 2,
    backgroundColor: `#ff5722`
  },
  FloatingActionButton: {
    width: 64,
    height: 64,
    borderRadius: 64 / 2,
    backgroundColor: "#2ecc71",
    position: "absolute",
    right: 10,
    bottom: 10,
    zIndex: 500,
    shadowColor: "#222",
    elevation: 2
  }
});
