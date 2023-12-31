import { deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db, storage } from "../../../firebase/config";
import Loader from "../../loader/Loader";
import styles from "./ViewProducts.module.scss";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { deleteObject, ref } from "firebase/storage";
import { Confirm } from "notiflix";
import { useDispatch, useSelector } from "react-redux";
import {
  STORE_PRODUCTS,
  selectProducts,
} from "../../../redux/slice/productSlice";
import useFetchCollection from "../../../customehooks/useFetchCollection";
import {
  FILTER_BY_SEARCH,
  selectFilterProducts,
} from "../../../redux/slice/filterSlice";
import Search from "../../search/Search";

const ViewProducts = () => {
  const { data, isLoading } = useFetchCollection("products");
  const products = useSelector(selectProducts);
  const filteredProducts = useSelector(selectFilterProducts);
  // const [products, setProducts] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      STORE_PRODUCTS({
        products: data,
      })
    );
  }, [dispatch, data]);

  useEffect(() => {
    dispatch(
      FILTER_BY_SEARCH({
        products,
        search,
      })
    );
  }, [dispatch, search, products]);

  // useEffect(() => {
  //   getAllProducts();
  // }, []);

  // const getAllProducts = () => {
  //   setIsLoading(true);

  //   try {
  //     // const query = getDocs(collection(db, "products"));
  //     // query.then((items) => {
  //     //   const allProducts = items.docs.map((doc) => {
  //     //     return {id:doc.id,...doc.data()}
  //     //   })
  //     //   console.log(allProducts)
  //     // })

  //     const productRef = collection(db, "products");
  //     const q = query(productRef, orderBy("date", "desc"));
  //     onSnapshot(q, (snapshot) => {
  //       const allproducts = snapshot.docs.map((item) => ({
  //         id: item.id,
  //         ...item.data(),
  //       }));
  //       // console.log(allproducts)
  //       setProducts(allproducts);
  //       dispatch(
  //         STORE_PRODUCTS({
  //           products: allproducts,
  //         })
  //       );
  //       setIsLoading(false);
  //     });
  //   } catch (error) {
  //     setIsLoading(false);
  //     toast.error(error.code);
  //   }
  // };

  const confirmDelete = (id, imageURL) => {
    Confirm.show(
      "Delete Product",
      "Do you want to delete the product",
      "Delete",
      "Cancle",
      () => {
        deleteProduct(id, imageURL);
        // alert("delete");
      },

      () => {
        console.log("");
        // alert("hava a nice day")
      },
      {
        titleColor: "red",
        titleFontSize: "2rem",
        okButtonColor: "white",
        okButtonBackground: "red",
        borderRadius: "3px",
        width: "400px",
      }
    );
  };

  const deleteProduct = async (id, image) => {
    // setIsLoading(true);
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("product deleted successfully");

      const productRef = ref(storage, image);
      await deleteObject(productRef);
    } catch (error) {
      // setIsLoading(false);
      toast.error(error.code);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className={styles.table}>
        <h2>All Products</h2>
        <div className={styles.search}>
          <p>
            <b>{filteredProducts.length}</b> products
          </p>
          <div className={styles.search}>
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {filteredProducts.length === 0 ? (
          <p>No result found</p>
        ) : (
          <div className={styles["product-container"]}>
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, index) => {
                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <img src={item.imageURL} alt="" />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>${item.price}</td>
                      <td className={styles["icons"]}>
                        <Link to={`/admin/add-product/${item.id}`}>
                          <FaEdit size={20} color="green" />
                        </Link>
                        <FaTrash
                          size={20}
                          color="red"
                          onClick={() => confirmDelete(item.id, item.imageURL)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewProducts;
