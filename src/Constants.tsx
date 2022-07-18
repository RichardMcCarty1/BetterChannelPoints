// eslint-disable-next-line import/prefer-default-export
export const clientId = 'getyourown';

export const scopes = [
  'channel:read:redemptions',
];

export const redirect = 'http://localhost:1212/auth';

export const generateAuthUrl = (state: string): string => {
  const scopesEncoded = encodeURIComponent(
    scopes.toString().replaceAll(',', ' ')
  );
  return `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirect}&scope=${scopesEncoded}&state=${state}`;
};
