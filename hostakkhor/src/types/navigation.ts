import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  CreatePost: undefined;     
  CreatePage: undefined;     
  PostDetail: { postId: number }; 
};


export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList, 
  T
>;

export type NavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  T
>;

export type RouteProp<T extends keyof RootStackParamList> = {
  params: RootStackParamList[T];
};
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type CompositeScreenProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp<T>;
  route: RouteProp<T>;
};