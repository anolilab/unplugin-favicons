const formatDuration = (ms: number): string => {
    if (ms < 0) {
        // eslint-disable-next-line no-param-reassign
        ms = -ms;
    }

    const time = {
        day: Math.floor(ms / 86_400_000),
        hour: Math.floor(ms / 3_600_000) % 24,
        minute: Math.floor(ms / 60_000) % 60,
        second: Math.floor(ms / 1000) % 60,
        // eslint-disable-next-line perfectionist/sort-objects
        ms: Math.floor(ms) % 1000,
    };

    return Object.entries(time)
        .filter((value) => value[1] !== 0)
        .map((value) => {
            if (value[0] === "ms") {
                return `${value[1]} ${value[0]}`;
            }

            return `${value[1]} ${value[1] === 1 ? value[0] : `${value[0]}s`}`;
        })
        .join(", ");
};

export default formatDuration;
