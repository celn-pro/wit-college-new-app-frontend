import auth from '@react-native-firebase/auth';

export const login = async (email: string, password: string) => {
  const { user } = await auth().signInWithEmailAndPassword(email, password);
  return user;
};

export const signup = async (email: string, password: string, role: string) => {
  const { user } = await auth().createUserWithEmailAndPassword(email, password);
  // Store role in Firestore or backend
  return user;
};

export const logout = async () => {
  await auth().signOut();
};