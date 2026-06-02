export const Ball = (props: {
    value?: number,
    onClick?: (value: number) => void,
    color: string,
    potted?: boolean,
    selected?: boolean,
    type: 'pool' | 'snooker',
}) => {


    if (props.type === 'pool') {
        return (
            <div className={`ball ${props.value ? (props.value < 8 ? 'solid' : props.value === 8 ? 'black' : 'stripes') : ''} ${props.potted ? 'potted' : ''} ${props.selected ? 'selected' : ''}`}
                onClick={() => {
                    if (props.value && props.onClick) props.onClick(props.value);
                }}
                style={{
                    borderColor: `color-mix(in srgb, ${props.color}, black 20%)`,
                }}
            >
                <div className="pattern"
                    style={{
                        backgroundColor: props.color,
                    }}
                >
                    <div className="number">
                        {props.value}
                    </div>
                </div>
            </div>
        );
    }
}
