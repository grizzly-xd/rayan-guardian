import { forwardRef } from 'react';

const Button = forwardRef(function Button(
  {
    children,
    variant = 'default',
    size,
    type = 'button',
    disabled = false,
    loading = false,
    onClick,
    className = '',
    ...rest
  },
  ref
) {
  const classes = ['btn'];
  if (variant !== 'default') classes.push(variant);
  if (size) classes.push(size);
  if (className) classes.push(className);

  return (
    <button
      ref={ref}
      type={type}
      className={classes.join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} aria-hidden="true" />}
      {children}
    </button>
  );
});

export default Button;
