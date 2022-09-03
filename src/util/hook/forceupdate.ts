import { useState, useCallback } from "react";

const useForceUpdate = () => {
    const [, updateState] = useState<Record<never, never>>();
    return useCallback(() => updateState({}), []);
};

export default useForceUpdate;
