import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Home: undefined;
  Profile: { userId: string };
  EditProfile: { userId: string };
<<<<<<< HEAD
  Pages: { pageId: string }; 
=======
  pages: { pageId: string }; 
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  EditPage: { pageId: string };
  CreatePost: undefined;
  CreatePage: undefined;
  PostDetail: { postId: string };
  PostEdit: { postId: string };
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