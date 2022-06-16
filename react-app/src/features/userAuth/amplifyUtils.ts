import { Hub } from '@aws-amplify/core';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';

export interface GraphQLOptions {
  input?: object;
  variables?: object;
  authMode?: GRAPHQL_AUTH_MODE;
}

export async function callGraphQL<T>(
  query: any,
  variables?: {} | undefined,
  authMode?: GRAPHQL_AUTH_MODE
): Promise<GraphQLResult<T>> {
  return (await API.graphql({
    ...graphqlOperation(query, variables),
    ...(authMode && { authMode }),
  })) as GraphQLResult<T>;
}

// amplify + typescript reference: https://dev.to/rmuhlfeldner/how-to-use-an-aws-amplify-graphql-api-with-a-react-typescript-frontend-2g79
interface SubscriptionValue<T> {
  value: { data: T };
}
export function subscribeGraphQL<T>(
  subscription: any,
  callback: (value: T) => void
) {
  //@ts-ignore
  return API.graphql(graphqlOperation(subscription)).subscribe({
    next: (response: SubscriptionValue<T>) => {
      callback(response.value.data);
    },
  });
}

export interface UseAuthHookResponse {
  currentUser: CognitoUser | null;
  signIn: () => void;
  signOut: () => void;
}

const getCurrentUser = async (): Promise<CognitoUser | null> => {
  try {
    return await Auth.currentAuthenticatedUser();
  } catch {
    // currentAuthenticatedUser throws an Error if not signed in
    return null;
  }
};

const useAuth = (): UseAuthHookResponse => {
  const [currentUser, setCurrentUser] = useState<CognitoUser | null>(null);

  useEffect(() => {
    const updateUser = async () => {
      setCurrentUser(await getCurrentUser());
    };
    Hub.listen('auth', updateUser); // listen for login/signup events
    updateUser(); // check manually the first time because we won't get a Hub event
    return () => Hub.remove('auth', updateUser);
  }, []);

  const signIn = () => Auth.federatedSignIn();

  const signOut = () => Auth.signOut();

  return { currentUser, signIn, signOut };
};

export default useAuth;

export { getCurrentUser };
