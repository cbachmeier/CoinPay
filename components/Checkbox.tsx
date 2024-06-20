// CustomCheckbox.tsx
import React from "react";
import {TouchableOpacity, View, StyleSheet} from "react-native";

const CustomCheckbox = ({isChecked, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkbox}>
      {isChecked && <View style={styles.checked} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
  },
});

export default CustomCheckbox;
