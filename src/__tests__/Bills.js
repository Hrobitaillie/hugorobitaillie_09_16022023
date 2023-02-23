/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js';
import Store from "../app/Store.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import store from "../__mocks__/store";

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

    })

    afterEach(()=>{
      document.body.innerHTML = '';
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true) // validation test to be highlighted

    })

    test("Then bills should be ordered from earliest to latest", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("If i click on New Bill Button", () =>{

      test("Then the user should be redirected to the new bill page", () => {

        // Define on navigate
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES_PATH.pathname
        }

        // Display Bills page
        document.body.innerHTML = BillsUI({ data: bills })

        // Create instance of class Bills
        const container = new Bills({
          document,
          onNavigate,
          Store,
          localStorage: window.localStorage,
        });


        // Get the click event action inside the Bills Class
        const handleClickNewBill = jest.fn(container.handleClickNewBill)

        const newBillButton = screen.getByTestId('btn-new-bill')
        // Test if the button is on the document
        expect(newBillButton).toBeInTheDocument()

        // Create Click Event
        newBillButton.addEventListener('click', handleClickNewBill)
        newBillButton.click()

        // Test if click event action is successfully called
        expect(handleClickNewBill).toHaveBeenCalled()
      })
    })

    describe("And there is Bills on the page", () => {

      test("Then the action button should display the action modal", async() => {

        // Display Bills page
        document.body.innerHTML = BillsUI({ data: bills })

        // Define on navigate
        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES_PATH.pathname
        }

        // Create instance of class Bills
        const container = new Bills({
          document,
          onNavigate,
          Store,
          localStorage: window.localStorage,
        });

        // Get the click event action inside the Bills Class
        const handleClickIconEye = jest.fn((icon) => container.handleClickIconEye(icon))

        // Get all the icon-eyes buttons
        const iconsAction = await waitFor(()=>{ return screen.findAllByTestId('icon-eye') })

        // Add click event on each button
        // then try the call
        iconsAction.forEach((icon) => {
          icon.addEventListener('click', handleClickIconEye(icon))
          userEvent.click(icon)
          expect(handleClickIconEye).toHaveBeenCalled()
        })

        // Get the modal element and add show class
        const modal = await waitFor(()=>{ return screen.findByTestId('modaleFile') })
        modal.classList.toggle("show")

        expect(modal.classList.contains("show")).toBe(true) // validation test
      })
    })
  })

  describe("When i fetch Bills API", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

    })

    afterEach(()=>{
      document.body.innerHTML = '';
    })

    test("Then get bills from Mocked API", async () => {

      const container = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      
      const billsList = await container.getBills()
      expect(billsList.length).toBe(4)

     })

    test("Then there is corrupted dates",()=>{
      
    })
  })
})

