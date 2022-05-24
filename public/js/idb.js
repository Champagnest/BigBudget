const RECORD_NAME = 'entry';
const apiPath = '/api/transaction/bulk';
const requestOptions = ( body ) => {
  return {
    method: 'POST',
    body: JSON.stringify( body ),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
};
let db;
const request = indexedDB.open('budget',1 );
request.onupgradeneeded = function ( e ) {
    const db = e.target.result;
    db.createObjectStore( RECORD_NAME, { autoIncrement: true} );
};
request.onsuccess = function ( e ) {
    db = e.target.result;
  
    if ( navigator.onLine ) {
      uploadRecords();
    }
  };
  
  request.onerror = function ( e ) {
    console.log( e.target.errorCode );
  };
  
  function saveRecord( record ) {
    const transaction = db.transaction( [ RECORD_NAME ], 'readwrite' );
  
    const entryObjStore = transaction.objectStore( RECORD_NAME );
  
    entryObjStore.add( record );
  }
  
  function uploadRecords() {
    const transaction = db.transaction( [ RECORD_NAME ], 'readwrite' );
  
    const entryObjStore = transaction.objectStore( 'entry' );
  
    const getAll = entryObjStore.getAll();
  
    getAll.onsuccess = function () {
      if ( getAll.result.length > 0 )
        fetch( apiPath, requestOptions( getAll.result ) )
          .then( response => response.json() )
          .then( serverResponse => {
            if ( serverResponse.message ) {
              throw new Error( serverResponse );
            }
  
            const transaction = db.transaction( [ RECORD_NAME ], 'readwrite' );
            const entryObjStore = transaction.objectStore( RECORD_NAME );
  
            entryObjStore.clear();
  
            alert( 'All transactions synced with server' );
          } )
          .catch( err => {
            console.log( err );
          } );
    };
  }
  
  window.addEventListener( 'online', uploadRecords );