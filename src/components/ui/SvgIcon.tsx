import { icons, type SvgIconName } from "./icons";

type SvgIconProps = {
    name: SvgIconName;
    size?: number;
};

function SvgIcon({ name, size = 20 }: SvgIconProps) {
    const Icon = icons[name];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            <Icon />
        </svg>
    );
}

export default SvgIcon;