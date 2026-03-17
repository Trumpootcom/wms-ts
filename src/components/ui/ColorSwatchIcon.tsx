type ColorSwatchIconProps = {
    color: "black" | "white";
    size?: number;
};

function ColorSwatchIcon({ color, size = 20 }: ColorSwatchIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            <rect
                x="0.5"
                y="0.5"
                width="19"
                height="19"
                fill={color}
                stroke="black"
                strokeWidth="1"
            />
        </svg>
    );
}

export default ColorSwatchIcon;