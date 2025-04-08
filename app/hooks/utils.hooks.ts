import lodash from "lodash";
import { useRef } from "react";
import {useParams} from '@remix-run/react';
const { isEmpty } = lodash;

export const useGetPreserveQueryData = <T>(queryData: T) => {
  const oldDataRef = useRef<T>();

  if (queryData) {
    oldDataRef.current = queryData;
  }

  const data = isEmpty(queryData) ? oldDataRef.current : queryData;

  return data;
};

export const useAddLocalePath = ()=>{
  const {locale} = useParams()

  const addLocalePath = (path:string)=>{
    if(!locale || path.startsWith(`/${locale}`)) {
      return path
    }
    return `/${locale}${path}`
  }
  return {
    addLocalePath
  }
}
