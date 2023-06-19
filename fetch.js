(async () => {
    try {
      const res = await fetch("http://10.152.183.20:5000/api/subscriber");
  
      if (!res.ok) {
        throw Error(res.statusText);
      }
  
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  })();