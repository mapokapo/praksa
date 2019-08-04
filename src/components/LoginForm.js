import React, { Component } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { Button } from "react-native-elements";

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      pass: "",
      warn: ""
    };
  }
  render() {
    return (
      <View style={{ display: "flex" }}>
        <TextInput
          style={{
            ...styles.textInput,
            marginVertical: this.props.smallTextButtonMargin + 3,
            borderColor: this.state.warn.includes("email") ? "#e74c3c" : "#065471"
          }}
          autoCapitalize="none"
          placeholder="Email"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => this.passwordInput.focus()}
          onChangeText={input => {
            this.setState({ email: input });
          }}
          onFocus={() => {
            let flag = this.state.warn;
            flag = flag.replace("email", "");
            this.setState({ warn: flag });
          }}
        />
        <TextInput
          style={{
            ...styles.textInput,
            marginVertical: this.props.smallTextButtonMargin + 3,
            borderColor: this.state.warn.includes("pass") ? "#e74c3c" : "#065471"
          }}
          autoCapitalize="none"
          placeholder="Password"
          returnKeyType="go"
          secureTextEntry={true}
          blurOnSubmit={false}
          ref={input => (this.passwordInput = input)}
          onSubmitEditing={this.login}
          onChangeText={input => {
            this.setState({ pass: input });
          }}
          onFocus={() => {
            let flag = this.state.warn;
            flag = flag.replace("pass", "");
            this.setState({ warn: flag });
          }}
        />
        <View
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginVertical: 5,
            marginBottom: this.props.smallTextButtonMargin + 5
          }}
        >
          <TouchableOpacity activeOpacity={0.5} onPress={() => {
            this.props.resetPass();
          }}>
            <Text
              style={{
                ...styles.smallTextButton,
                marginVertical: this.props.smallTextButtonMargin
              }}
            >
              Forgot your password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={() => {
            this.props.noAccount();
          }}>
            <Text
              style={{
                ...styles.smallTextButton,
                marginVertical: this.props.smallTextButtonMargin
              }}
            >
              Don't have an account?
            </Text>
          </TouchableOpacity>
        </View>
        <Button title="LOGIN" buttonStyle={styles.bigButton} onPress={() => {
          this.login();
        }} />
      </View>
    );
  }

  login = () => {
    let flag = "";
    let keys = Object.keys(this.state);
    for (key of keys) {
      if (this.state[key] === "" && key !== "warn") {
        flag += key;
      }
    }
    if (flag === "") {
      this.setState({ warn: "" });
      this.props.login(this.state);
    } else {
      this.setState({ warn: flag });
    }
  }
}

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    borderStyle: "solid",
    position: "relative",
    backgroundColor: "#fff"
  },
  smallTextButton: {
    color: "#3fb0fc"
  },
  bigButton: {
    height: 50,
    backgroundColor: "#3498db"
  }
});
