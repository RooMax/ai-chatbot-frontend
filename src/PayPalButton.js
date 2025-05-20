import React, { useEffect } from 'react';

function PayPalButton({ onApprove }) {
  useEffect(() => {
    if (window.paypal) {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'pill',
          label: 'subscribe'
        },
        createSubscription: function (data, actions) {
          return actions.subscription.create({
            plan_id: process.env.REACT_APP_PAYPAL_PLAN_ID// PayPal Sub Plan ID
          });
        },
        onApprove: function (data, actions) {
          console.log('Subscription completed:', data);
          onApprove(data); // callback to update user status
        }
      }).render('#paypal-button-container');
    }
  }, [onApprove]);

  return <div id="paypal-button-container"></div>;
}

export default PayPalButton;
