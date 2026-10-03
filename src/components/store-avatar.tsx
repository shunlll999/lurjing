interface StoreAvatarProps {
  src?: string;
  name?: string;
  className?: string;
  eager?: boolean;
}

export function StoreAvatar({
  src,
  name = "ร้าน",
  className = "",
  eager = false,
}: StoreAvatarProps) {
  const initial = (name.trim() || "ร").slice(0, 1).toUpperCase();

  return (
    <span className={`store-avatar ${className}`.trim()} aria-hidden="true">
      {src ? (
        <img
          src={src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initial}</span>
      )}
    </span>
  );
}
