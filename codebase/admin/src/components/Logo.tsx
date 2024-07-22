
interface LogoType {
    width?: number,
    color?: string //rgba(255,255,255,0.75)
}

export const Logo : React.FC<LogoType> = ({width=100, color='rgba(255,255,255,0.75)'}) => {

    return (
        <svg style={{width: width}} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 75">
            <path fill={color} d="M99,69.69h-22.63l-3.57-5.38h16.38l-20.74-52.77-14.99,34.8,10.03,23.35h-7.59l-6.2-14.6-6.29,14.6h-7.7l10.22-23.47L31.15,11.54l-20.46,52.77h16.15l-3.52,5.38H1L27.66,4h7.59l14.41,33.56,14.61-33.56h7.7l27.03,65.69Z"/>
        </svg>
    );
}