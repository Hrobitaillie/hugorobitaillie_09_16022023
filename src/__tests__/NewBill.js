/**
 * @jest-environment jsdom
 */
import router from "../app/Router.js";
import { screen , waitFor, fireEvent} from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import store from "../__mocks__/store";

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.alert = () => {};
    })

    afterEach(()=>{
      document.body.innerHTML = '';
    })

    describe("When i upload a new file with on of this format: jpg, jpeg, png", () => {
      test("Then file should be updated and saved in bill", async() => {
        document.body.innerHTML = NewBillUI()

        // Define on navigate
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES_PATH.pathname
        }

        const content = new NewBill({
            document,
            onNavigate,
            store : store,
            localStorage : window.localStorage
        })

        const handleChangeFile = jest.fn((e)=> content.handleChangeFile(e))
        const fileInput = await waitFor(()=>screen.findByTestId('file'))
        fileInput.classList.add("invalid")

        const file = new File(["file.jpg"], "file.jpg", {type: "image/jpg"});
        
        
        fileInput.addEventListener('change',handleChangeFile)
        userEvent.upload(fileInput, file);


        console.log(
          "Input File Length: ", fileInput.files.length, '\n',
          "Input ClassList: ",fileInput.classList.value, '\n',
          "The input is valid"
        );

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files.length).toEqual(1)
        expect(fileInput.classList.contains('invalid')).toBeFalsy();
      })

    })

    describe("When i upload a new file with wrong format",() => {
      test("Then file should be updated and saved in bill", async() => {

        document.body.innerHTML = NewBillUI()

        // Define on navigate
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES_PATH.pathname
        }

        const content = new NewBill({
            document,
            onNavigate,
            store : store,
            localStorage : window.localStorage
        })

        const handleChangeFile = jest.fn(content.handleChangeFile)
        const fileInput = await waitFor(()=>screen.findByTestId('file'))
        fileInput.addEventListener('change',(e) => { handleChangeFile(e) })

        const file = new File(["file.txt"], "file.txt", {type: "text/plain"});
        userEvent.upload(fileInput, file);
        
        // console.log(
        //   "Input File Length: ", fileInput.files.length, '\n',
        //   "Input ClassList: ",fileInput.classList.value, '\n',
        //   "The input is invalid"
        // );

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files.length).toEqual(1)
        expect(fileInput.classList.contains('invalid')).toBeTruthy();
      })
    })
  })

  // Test API
  describe("when i submit the new bill form", () => {
    beforeEach(() => {

      jest.spyOn(store, "bills");
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("then a new bill shoud be created and saved", async () => {

      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const content = new NewBill({
          document,
          onNavigate,
          store : store,
          localStorage : localStorageMock
      })
      const handleSubmit = jest.fn(content.handleSubmit)

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(store.bills).toHaveBeenCalled()
    })
    test("Api send me a 404 message error", async () =>{

      store.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
    })

    test("Api send me a 500 message error", async () =>{

      store.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
    })
  })

})