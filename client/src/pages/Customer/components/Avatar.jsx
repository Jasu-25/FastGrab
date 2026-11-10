/** Round profile picture, falling back to initials. */
function Avatar({ user, size = 32 }) {
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) }

  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className="avatar-circle" style={style} />
  }
  return (
    <span className="avatar-circle" style={style} aria-hidden="true">
      {initials}
    </span>
  )
}

export default Avatar
