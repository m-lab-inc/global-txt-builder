import React from 'react';
import globalTextMap from '../outputs/globalTextMapCache.json';
import {GlobalText} from '../components/GlobalText';

const ChildComponent = ({children}: {children: React.ReactNode}) => {
  return <div>{children}</div>;
};

export default function Page() {
  return (
    <GlobalText
      WrapperComponent={ChildComponent}
      globalTextMap={globalTextMap}
      lang={'en'}
    >
      アバター変更
    </GlobalText>
  );
}
