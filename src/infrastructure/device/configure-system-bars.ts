import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "react-native";

export function configureAndroidSystemBars(backgroundColor: string): void {
  StatusBar.setHidden(false);
  StatusBar.setBarStyle("dark-content");
  StatusBar.setBackgroundColor(backgroundColor);
  StatusBar.setTranslucent(false);
  NavigationBar.setHidden(false);
  NavigationBar.setStyle("light");
}
