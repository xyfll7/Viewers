import React from 'react';
import { FooterAction } from '@ohif/ui-next';
import i18n from 'i18next';
export function UntrackSeriesModal({ hide, onConfirm, message }) {
  return (
    <div className="text-foreground text-[13px]">
      <div>
        <p>{message}</p>
        <p className="mt-2">
          {`${i18n.t('AboutModal:This action cannot be undone and will delete all your existing measurements.')}`}
        </p>
      </div>
      <FooterAction className="mt-4">
        <FooterAction.Right>
          <FooterAction.Secondary onClick={hide}>{`${i18n.t('AboutModal:Cancel')}`}</FooterAction.Secondary>
          <FooterAction.Primary
            onClick={() => {
              onConfirm();
              hide();
            }}
          >
            {`${i18n.t('AboutModal:Confirm')}`}
          </FooterAction.Primary>
        </FooterAction.Right>
      </FooterAction>
    </div>
  );
}
