import { Avatar } from '@mui/material';
import { TEAM } from './constants';

const PALETTE = ['#2F6F5B', '#3B5B8C', '#7A4E8C', '#8C6A2F', '#8C3B4E', '#3B7A80', '#5B6B2F'];

export const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Shared avatar look, usable directly on <Avatar> (needed inside <AvatarGroup>). */
export const avatarSx = (user, size = 32) => {
  const idx = Math.max(TEAM.findIndex((u) => u.id === user.id), 0);
  return {
    width: size,
    height: size,
    fontSize: size * 0.4,
    fontWeight: 700,
    bgcolor: PALETTE[idx % PALETTE.length],
    color: '#fff',
  };
};

export default function UserAvatar({ user, size = 32, sx }) {
  return (
    <Avatar title={user.name} sx={{ ...avatarSx(user, size), ...sx }}>
      {initials(user.name)}
    </Avatar>
  );
}
