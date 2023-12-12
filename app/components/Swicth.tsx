import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { type TDivProps } from '~/utils/types';

export default function Swicth({
  value,
  onChange,
  ...divProps
}: Omit<TDivProps, 'value' | 'onChange'> & {
  value?: boolean;
  onChange?: (isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(value);
  useEffect(() => {
    setIsOpen(value);
  }, [value]);

  return (
    <div
      {...divProps}
      className={
        'inline-block h-5 relative overflow-hidden rounded-full w-[calc(46px+10px)] ' +
        divProps.className
      }
    >
      <div
        className={classNames({
          'absolute flex justify-center items-center text-center h-full transition-[1s] cursor-pointer select-none':
            true,
          'left-[calc(-46px+10px)] bg-[#efefef]': !isOpen,
          'left-0 bg-[#2a2a2a]': isOpen,
        })}
        onClick={() => {
          // 有传入value， 则受控模式
          if (value === undefined) {
            setIsOpen((isOpen) => !isOpen);
          } else {
            onChange?.(!isOpen);
          }
        }}
      >
        <div className="text-white h-full w-[46px] pr-[4px] text-[10px]">
          已开启
        </div>
        <div
          className={classNames({
            'bg-white h-4 w-4 border-solid border-[2px] transition-all rounded-full box-content mx-[-10px]':
              true,
            'border-[#efefef]': !isOpen,
            'border-[#2a2a2a]': isOpen,
          })}
        />
        <div className="text-[#858585] h-full w-[46px] pl-[4px] text-[10px]">
          已关闭
        </div>
      </div>
    </div>
  );
}
