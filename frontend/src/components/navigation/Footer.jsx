import PropTypes from 'prop-types'
import Logo from '../../assets/logos.png'

function Footer({ variant = 'light', className = '', maxWidth = 'max-w-7xl', horizontalPadding = 'px-6 sm:px-8 lg:px-12' }) {
  const currentYear = new Date().getFullYear()

  const styles = {
    light: {
      wrapper: 'bg-white border-t border-slate-200',
      icon: 'text-blue-600',
      title: 'text-slate-700',
      divider: 'bg-slate-300',
      copyright: 'text-slate-500',
      powered: 'text-slate-400',
      highlight: 'text-blue-600',
      developer: 'text-slate-400',
      developerName: 'text-slate-500',
    },
    dark: {
      wrapper: 'bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50',
      icon: 'text-blue-400',
      title: 'text-white',
      divider: 'bg-slate-600',
      copyright: 'text-slate-400',
      powered: 'text-slate-500',
      highlight: 'text-blue-400',
      developer: 'text-slate-500',
      developerName: 'text-slate-400',
    },
  }

  const s = styles[variant] || styles.light

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-40 py-4 shadow-sm ${s.wrapper} ${className}`}>
      <div className={`${maxWidth} mx-auto ${horizontalPadding}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left side - Branding and copyright */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <img src={Logo} alt="MIS System logo" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-0.5">
              <p className={`text-sm font-semibold ${s.title}`}>MIS System</p>
              <p className={`text-xs ${s.copyright}`}>
                &copy; {currentYear} RBT bank Inc. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* Right side - Powered by and developer credit */}
          <div className="text-center md:text-right space-y-0.5">
            <p className={`text-xs ${s.powered}`}>
              Powered by <span className={`font-medium ${s.highlight}`}>MIS Department</span>
            </p>
            <p className={`text-xs ${s.developer}`}>
              Designed & Developed by{' '}
              <span className={`text-sm font-medium ${s.developerName}`}>Augustin Maputol</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

Footer.propTypes = {
  variant: PropTypes.oneOf(['light', 'dark']),
  className: PropTypes.string,
  maxWidth: PropTypes.string,
  horizontalPadding: PropTypes.string,
}

export default Footer
