export function PostToInstagramAction(props) {
  const { published, draft, onComplete } = props;
  const doc = draft || published;

  return {
    label: 'Post to Instagram',
    disabled: !doc || !doc.name,
    onHandle: async () => {
      if (!doc) return;

      try {
        const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const secret = "axasz_store_reval_secret_key_2026_x92";
        
        const res = await fetch(`${appUrl}/api/instagram?secret=${secret}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: doc._id,
            name: doc.name,
            brand: doc.brand,
            price: doc.price,
            productCode: doc.productCode,
            image: doc.image
          })
        });

        if (res.ok) {
          alert(`Successfully sent "${doc.name}" to Instagram!`);
        } else {
          const errData = await res.json();
          alert(`Failed to post to Instagram: ${errData.error || 'Unknown error'}`);
        }
      } catch (e) {
        alert(`Error: ${e.message}`);
      }

      if (onComplete) {
        onComplete();
      }
    }
  };
}

export function createPublishAndInstagramAction(originalPublishAction) {
  return (props) => {
    const originalResult = originalPublishAction(props);
    
    return {
      ...originalResult,
      onHandle: async () => {
        const doc = props.draft || props.published;
        
        // Execute original publish action
        if (originalResult.onHandle) {
          await originalResult.onHandle();
        }

        // Post to Instagram automatically after publish
        if (doc) {
          try {
            const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
            const secret = "axasz_store_reval_secret_key_2026_x92";
            
            fetch(`${appUrl}/api/instagram?secret=${secret}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                _id: doc._id,
                name: doc.name,
                brand: doc.brand,
                price: doc.price,
                productCode: doc.productCode,
                image: doc.image
              })
            }).then(res => {
              if (res.ok) {
                console.log("Successfully auto-posted to Instagram upon publish!");
              } else {
                console.error("Failed to auto-post to Instagram upon publish.");
              }
            }).catch(err => {
              console.error("Error auto-posting to Instagram upon publish:", err);
            });
          } catch (e) {
            console.error("Error in Instagram publish hook:", e);
          }
        }

        if (props.onComplete) {
          props.onComplete();
        }
      }
    };
  };
}
