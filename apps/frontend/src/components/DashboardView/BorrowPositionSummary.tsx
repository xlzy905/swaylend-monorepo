import {
  useBorrowCapacity,
  useMarketConfiguration,
  usePrice,
  useUserSupplyBorrow,
} from '@/hooks';
import { useUserLiquidationPoint } from '@/hooks/useUserLiquidationPoint';
import { getFormattedPrice } from '@/utils';
import { useIsConnected } from '@fuels/react';
import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import PlusIcon from '/public/icons/plus-filled.svg?url';
import XIcon from '/public/icons/x-filled.svg?url';
import { InfoIcon } from '../InfoIcon';
import { Line } from '../Line';

export const BorrowPositionSummary = () => {
  const { isConnected } = useIsConnected();
  const { data: borrowCapacity } = useBorrowCapacity();
  const { data: userLiquidationPoint } = useUserLiquidationPoint();
  const { data: userSupplyBorrow } = useUserSupplyBorrow();
  const { data: priceData } = usePrice();
  const { data: marketConfiguration } = useMarketConfiguration();
  const [open, setOpen] = useState(false);

  const updatedBorrowCapacity = useMemo(() => {
    if (!marketConfiguration || !priceData || !borrowCapacity) {
      return BigNumber(0);
    }
    let updatedBorrowCapacity = borrowCapacity?.minus(
      BigNumber(1).div(
        priceData?.prices[marketConfiguration?.baseToken.bits ?? ''] ?? 1
      )
    );

    updatedBorrowCapacity = updatedBorrowCapacity?.lt(0)
      ? BigNumber(0)
      : updatedBorrowCapacity;

    return updatedBorrowCapacity;
  }, [marketConfiguration, borrowCapacity, priceData]);

  if (!isConnected || !userSupplyBorrow || userSupplyBorrow.borrowed.eq(0)) {
    return null;
  }

  return (
    <>
      <div className="relative w-full">
        <div className="absolute left-[calc(50%-2px)] top-[10px] md:top-[18px] h-[16px] z-0 w-[4px] bg-gradient-to-b from-white/0 to-primary" />
      </div>
      <div className="mt-[20px] md:mt-[30px] max-w-[800px] w-full">
        <div className="flex flex-col items-center justify-center gap-y-1">
          {!open ? (
            <button
              type="button"
              className="z-10"
              onClick={() => setOpen(true)}
            >
              <Image src={PlusIcon} alt="plus" height={24} width={24} />
            </button>
          ) : (
            <button
              type="button"
              className="z-10"
              onClick={() => setOpen(false)}
            >
              <Image src={XIcon} alt="x" height={24} width={24} />
            </button>
          )}
          <div className="text-primary font-medium">Position Summary</div>
        </div>
        {open && (
          <div className="w-full flex justify-center mt-4">
            <div className="w-[75%] sm:w-[60%]">
              <Line />
              <div className="w-full flex flex-col gap-y-4 p-4">
                <div className="text-md font-semibold flex text-lavender justify-between">
                  <div className="flex gap-x-1">
                    Liquidation Point{' '}
                    <InfoIcon
                      text={
                        'The price of supplied collateral at which your position will be liquidated'
                      }
                    />
                  </div>
                  <div className="text-primary text-right">
                    {getFormattedPrice(userLiquidationPoint ?? BigNumber(0))}
                  </div>
                </div>
                <div className="text-md font-semibold text-lavender flex justify-between">
                  <div className="flex gap-x-1">
                    Available To Borrow{' '}
                    <InfoIcon
                      text={'The total value of your collateral in USDC'}
                    />
                  </div>
                  <div className="text-primary text-right">
                    {getFormattedPrice(updatedBorrowCapacity)}
                  </div>
                </div>
              </div>
              <Line />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
