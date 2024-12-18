const main = async () => {
  const maxI = 100;
  const maxJ = 100;
  for (let i = 0; i < maxI; i++) {
    console.log(`${i}/${maxI}`);
    const promises: Promise<any>[] = [];
    for (let j = 0; j < maxJ; j++) {
      console.log(i * maxJ + j);
      promises.push(
        fetch("http://0.0.0.0:8080/http://localhost:3000/dev/postEndpoint/", {
          method: "POST",
          body: JSON.stringify({
            address: "0x1234512345123451234512345123451234512345",
          }),
        }),
      );
    }
    await Promise.all(promises);
  }
};

main();
