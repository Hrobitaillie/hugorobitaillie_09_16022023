/**
 * @jest-environment jsdom
 */
import router from "../app/Router.js";
import { screen , waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import store from "../__mocks__/store";

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";


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
        
        console.log(
          "Input File Length: ", fileInput.files.length, '\n',
          "Input ClassList: ",fileInput.classList.value, '\n',
          "The input is invalid"
        );

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files.length).toEqual(1)
        expect(fileInput.classList.contains('invalid')).toBeTruthy();
      })
    })

    describe("when i submit the new bill form", () => {

      test("then a new bill shoud be created and saved", async () => {

        const bill = {
          id: "47qAXb6fIm2zOKkLzMro",
          email: "test@test.com",
          type: "Hôtel et logement",
          name: "Jest Test Bill" ,
          amount: 300,
          date:  new Date(),
          vat: "666",
          pct: 666,
          commentary: "",
          fileUrl: "https://kultt.fr/wp-content/uploads/2022/09/RickAstley-ad2022.jpg",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          status: 'pending'
        }
      })

    })

  })

})
