import React, { useState } from "react";
import { View, Switch, StyleSheet } from "react-native";

const SwitchBooking = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <Switch
         trackColor={{ false: "#767577", true: "#33A0D6" }}
         thumbColor={isEnabled ? "white" : "white"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default SwitchBooking;