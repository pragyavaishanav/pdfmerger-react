import { useEffect, useState } from "react";

export const useCustomSearchParams = () => {
    const [stateParam, setStateParam] = useState<string | undefined | null>(undefined)
    const [code, setCode] = useState<string | undefined | null>(undefined)

    useEffect(() => {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
        setStateParam(url.searchParams.get("state"))
        setCode(url.searchParams.get("code"))
        }
      }, []);

      return  {
        stateParam,
        code
      }
}